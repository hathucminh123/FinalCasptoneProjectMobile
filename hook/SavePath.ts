import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigationState } from '@react-navigation/native';

export const getCurrentScreen = async() => {
  const currentRoute = useNavigationState(state => state.routes[state.index]);

  await AsyncStorage.setItem("redirectPath",currentRoute.toString())

  return currentRoute.name; 
};