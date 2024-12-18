'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Popout.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react';

type HeroIcon = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & {
    title?: string | undefined;
    titleId?: string | undefined;
} & RefAttributes<SVGSVGElement>>;

// Types
export interface PopoutProps {
  id: string;
  title?: string;
  message: string | React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error' | 'discord';
  duration?: number;
  showCloseButton?: boolean;
  customIcon?: IconDefinition | HeroIcon;
  customButton?: {
    text: string;
    onClick: () => void;
    icon?: IconDefinition | HeroIcon;
  };
  onClose?: () => void;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
}

interface PopoutContextType {
  showPopout: (props: Omit<PopoutProps, 'id'>) => string;
  closePopout: (id: string) => void;
  closeAllPopouts: () => void;
}

// Context
const PopoutContext = createContext<PopoutContextType | undefined>(undefined);

// Animations
const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 50, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  bounce: {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: [1.1, 0.9, 1], opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
};

// Get icon based on type
const getIcon = (type: PopoutProps['type'], customIcon?: IconDefinition | HeroIcon) => {
  if (customIcon) return customIcon;
  switch (type) {
    case 'success':
      return CheckCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'error':
      return XCircleIcon;
    case 'discord':
      return faDiscord;
    default:
      return InformationCircleIcon;
  }
};

// Get position styles
const getPosition = () => {
  return {};
};

// Individual Popout Component
const PopoutItem: React.FC<PopoutProps> = ({
  id,
  title,
  message,
  type = 'info',
  showCloseButton = true,
  customIcon,
  customButton,
  onClose,
  animation = 'fade',
}) => {
  const Icon = getIcon(type, customIcon);
  const animationVariants = animations[animation];

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'popout-success';
      case 'warning':
        return 'popout-warning';
      case 'error':
        return 'popout-error';
      case 'discord':
        return 'popout-discord';
      default:
        return 'popout-info';
    }
  };

  const renderIcon = (icon: IconDefinition | HeroIcon) => {
    if ('icon' in icon || 'iconName' in icon) {
      return <FontAwesomeIcon icon={icon as IconDefinition} />;
    }
    const HeroIcon = icon;
    return <HeroIcon className="w-6 h-6" />;
  };

  return (
    <motion.div className="popout-container">
      <motion.div
        className={`popout ${getTypeClass()}`}
        initial={animationVariants.initial}
        animate={animationVariants.animate}
        exit={animationVariants.exit}
        transition={{ duration: 0.3 }}
      >
        {showCloseButton && (
          <button onClick={onClose} className="close-button" aria-label="Close">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
        <div className="popout-content">
          <div className="popout-icon">
            {renderIcon(Icon)}
          </div>
          {title && <h3 className="popout-title">{title}</h3>}
          <div className="popout-message">{message}</div>
          {customButton && (
            <button className="custom-button" onClick={customButton.onClick}>
              {customButton.icon && renderIcon(customButton.icon)}
              {customButton.text}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Provider Component
export const PopoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [popouts, setPopouts] = useState<{ [type: string]: PopoutProps }>({});

  const showPopout = (props: Omit<PopoutProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const type = props.type || 'info';
    
    setPopouts(prev => ({
      ...prev,
      [type]: { ...props, id }
    }));

    if (props.duration && props.duration > 0) {
      setTimeout(() => closePopout(id), props.duration);
    }

    return id;
  };

  const closePopout = (id: string) => {
    setPopouts(prev => {
      const newPopouts = { ...prev };
      Object.keys(newPopouts).forEach(type => {
        if (newPopouts[type].id === id) {
          delete newPopouts[type];
        }
      });
      return newPopouts;
    });
  };

  const closeAllPopouts = () => {
    setPopouts({});
  };

  return (
    <PopoutContext.Provider value={{ showPopout, closePopout, closeAllPopouts }}>
      {children}
      <AnimatePresence>
        {Object.values(popouts).map((popout) => (
          <PopoutItem
            key={popout.id}
            {...popout}
            onClose={() => {
              closePopout(popout.id);
              popout.onClose?.();
            }}
          />
        ))}
      </AnimatePresence>
    </PopoutContext.Provider>
  );
};

// Hook for using popouts
export const usePopout = () => {
  const context = useContext(PopoutContext);
  if (!context) {
    throw new Error('usePopout must be used within a PopoutProvider');
  }
  return context;
};

// Default export for backward compatibility
const Popout: React.FC = () => {
  const { showPopout } = usePopout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      showPopout({
        type: 'discord',
        message: 'Entre no nosso servidor para ajudar a nossa comunidade a crescer',
        animation: 'scale',
        customButton: {
          text: 'Entrar no servidor',
          onClick: () => window.open('https://discord.gg/WCbhw7MZW9', '_blank'),
          icon: faDiscord,
        },
        duration: 0,
      });
    }
  }, [mounted, showPopout]);

  return null;
};

export default Popout;
