import React, {FC} from 'react';
import {IconComponents} from '@components/Icon/IconComponents';
import {SvgProps} from 'react-native-svg';

interface IconProps extends SvgProps {
  name: keyof typeof IconComponents;
}

const Icon: FC<IconProps> = ({
  name,
  width = '100%',
  height = '100%',
  ...props
}) => {
  const IconComponent = IconComponents[name];

  return <IconComponent width={width} height={height} {...props} />;
};

export default Icon;
