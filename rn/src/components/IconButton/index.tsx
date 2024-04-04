import {FC} from 'react';
import {Button, ButtonProps, useTheme} from '@rneui/themed';
import {StyleProp, ViewStyle} from 'react-native';
import {IconProps, IconType} from '@rneui/base/dist/Icon/Icon';
import {IconComponents} from '@components/Icon/IconComponents.ts';
import Icon from '@components/Icon';

interface IconButtonLocalProps extends ButtonProps {
  iconType: 'local';
  iconName: keyof typeof IconComponents;
  iconProps?: IconProps;
  buttonSize?: number;
}

interface IconButtonOtherProps extends ButtonProps {
  iconType: Exclude<IconType, 'local'>;
  iconName: string;
  iconProps?: IconProps;
  buttonSize?: number;
}

type IconButtonProps = IconButtonLocalProps | IconButtonOtherProps;

const IconButton: FC<IconButtonProps> = ({
  iconName,
  iconType = 'font-awesome',
  onPress,
  buttonStyle,
  iconContainerStyle,
  iconProps,
  buttonSize = 74,
  type = 'outline',
  radius = 100,
  ...props
}) => {
  const {theme} = useTheme();

  const mergedButtonStyles: StyleProp<ViewStyle> = {
    borderColor: theme.colors.grey2,
    width: buttonSize,
    height: buttonSize,
    ...(buttonStyle as object),
  };

  const mergedIconContainerStyle: StyleProp<ViewStyle> = {
    position: 'absolute',
    ...(iconContainerStyle as object),
  };

  const Component =
    iconType === 'local' ? (
      <Icon name={iconName as keyof typeof IconComponents} />
    ) : undefined;

  const mergedIconProps = {
    name: iconName,
    type: iconType,
    size: 20,
    color: theme.colors.primary,
    ...iconProps,
  };

  return (
    <Button
      icon={Component || mergedIconProps}
      type={type}
      radius={radius}
      onPress={onPress}
      buttonStyle={mergedButtonStyles}
      iconContainerStyle={mergedIconContainerStyle}
      {...props}
    />
  );
};

export default IconButton;
