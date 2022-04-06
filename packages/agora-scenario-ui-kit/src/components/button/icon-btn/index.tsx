import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import './index.css';

export interface IconButtonProps extends BaseProps {
  icon?: React.ReactNode;
  buttonText?: string;
  buttonTextColor?: string;
  onClick?: (e: any) => void | Promise<void>;
}

export const IconButton: FC<IconButtonProps> = ({
  icon,
  buttonText = '',
  buttonTextColor = '',
  onClick = () => {
    console.log('icon btn click');
  },
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`fcr-icon-btn`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps} onClick={onClick}>
      {icon}
      <span className="fcr-icon-btn-text" style={{ color: buttonTextColor }}>
        {buttonText}
      </span>
    </div>
  );
};
