import { useTheme } from 'native-base';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import HomeSvg from '@assets/homeSVG.svg';
import AdvertsSvg from '@assets/advertsSVG.svg';
import LogoutSvg from '@assets/logoutSVG.svg'; 

import  Home  from '@screens/Home';
import { MyAdverts } from '@screens/MyAdverts';
import { SignIn } from '@screens/SignIn';
import { CreateAdverts } from '@screens/CreateAdverts';
import { PreviewProduct } from '@screens/PreviewProduct';
import { MyProduct } from '@screens/MyProduct';
import { EditMyAdverts } from '@screens/EditMyAdverts';
import { DetailsProduct } from '@screens/DetailsProduct';
import { ProductToBuy } from '@screens/ProductToBuy';

import { useAuth } from '@hooks/useAuth'

type AppRoutes = {
  home: undefined;
  myAdverts: undefined;
  signOut: undefined;
  createAdverts: undefined;
  productToBuy: { productId: string }
  editMyAdverts: { productId: string }
  previewProduct: { product: string, edit?: boolean }
  detailsProduct: {productId: string }
  myProduct: { myProductId: string }
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

      <Screen 
        name='createAdverts'
        component={CreateAdverts}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Screen 
        name='previewProduct'
        component={PreviewProduct}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Screen 
        name='myProduct'
        component={MyProduct}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Screen 
        name='editMyAdverts'
        component={EditMyAdverts}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Screen 
        name='detailsProduct'
        component={DetailsProduct}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Screen 
        name='productToBuy'
        component={ProductToBuy}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />


    </Navigator>
  )
}