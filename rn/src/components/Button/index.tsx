import {FC} from 'react';
import {Button as RNEButton, ButtonProps} from '@rneui/themed';

const Button: FC<ButtonProps> = ({type = 'solid', ...props}) => {
  const isClearType = type === 'clear';
  return (
    <RNEButton
      type={type}
      buttonStyle={{
        backgroundColor: isClearType ? 'transparent' : 'rgba(78, 116, 289, 1)',
        borderRadius: 50,
      }}
      containerStyle={{
        width: isClearType ? 'auto' : '100%',
        marginVertical: isClearType ? 0 : 20,
        marginHorizontal: 0,
      }}
      titleStyle={{
        fontSize: 16,
        lineHeight: 16,
        fontWeight: 'bold',
        color: isClearType ? 'rgba(78, 116, 289, 1)' : 'white',
      }}
      {...props}
    />
  );
};

export default Button;
