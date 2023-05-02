import { Platform } from 'react-native';
import { useTheme } from 'native-base';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
 
import HomeSvg from '@assets/homeSVG.svg';
import AdvertsSvg from '@assets/advertsSVG.svg';
import LogoutSvg from '@assets/logoutSVG.svg'; 

import { Home } from '@screens/Home';
import { MyAdverts } from '@screens/MyAdverts';
import { SignIn } from '../screens/SignIn';
import { useAuth } from '@hooks/useAuth'

type AppRoutes = {
  home: undefined;
  myAdverts: undefined;
  signOut: undefined;

}

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;
const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

export function AppRoutes(){
  const { sizes, colors } = useTheme();
  const iconSize = sizes[6];
  const { signOut } = useAuth()

  return (
    <Navigator screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: colors.gray[100],
      tabBarInactiveTintColor: colors.gray[400],
      tabBarStyle: {
        backgroundColor: colors.gray[700],
        borderTopWidth: 0,
        //height: Platform.OS === 'android' ? 'auto' : 96,
        //paddingBottom: sizes[10],
        //paddingTop: sizes[6]
      }
    }}>
        
        <Screen
          name="home"
          component={Home}
          options={{
            tabBarIcon: ({ color }) => (
              <HomeSvg fill={color} width={iconSize} height={iconSize} />
            ),
            tabBarItemStyle: {
              backgroundColor: 'gray.200'
            }
          }}
        />

        <Screen
          name="myAdverts"
          component={MyAdverts}
          options={{
            tabBarIcon: ({ color }) => (
              <AdvertsSvg fill={color} width={iconSize} height={iconSize} />
            )
          }}
        />

        <Screen
          name="signOut"
          component={SignIn}
          options={{
            tabBarIcon: () => (
              <LogoutSvg fill={'#EE7979'} width={iconSize} height={iconSize} />
            )
          }}
          listeners={() => ({
            tabPress: async () => {
              await signOut()
            }
          })}
        />

      {/*<Screen 
        name='productToBuy'
        component={ProductToBuy}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
        */}
    </Navigator>
  )
}