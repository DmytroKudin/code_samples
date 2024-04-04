import type {StackNavigationOptions} from '@react-navigation/stack';

const defaultScreenOptions: StackNavigationOptions = {
  cardStyle: {
    overflow: 'visible',
    flex: 1,
  },
  animationTypeForReplace: 'push',
};

export default defaultScreenOptions;
