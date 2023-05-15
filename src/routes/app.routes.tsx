import { createBottomTabNavigator, BottomTabNavigationProp  } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationProp  } from '@react-navigation/native-stack';
import { Pressable, useTheme } from 'native-base';
import { Platform } from 'react-native';
import { useContext } from 'react';

import { AuthContext } from '@contexts/AuthContext';
import { ProductDTO } from '@dtos/ProductDTO';

import { House, SignOut, Tag } from 'phosphor-react-native';

import { Home } from '@screens/Home';
import { Product } from '@screens/Product';
import { MyProducts } from '@screens/MyProducts';
import { CreateProduct, PhotoType } from '@screens/CreateProduct';
import { PreviewProduct } from '@screens/PreviewProduct';

type HomeTabNavigationProps = {
  home: undefined;
  myProducts: undefined;
  signOut: undefined;
}

type AppRoutes = {
  homeTab: undefined;
  product?: {
    isOwner: boolean;
    productId: string; 
  };
  newProduct: undefined;
  previewProduct: {
    product: ProductDTO;
    photos: Array<PhotoType>;
  }
}

export type HomeTabNavigatorRoutesProps = BottomTabNavigationProp<HomeTabNavigationProps>;
export type AppNavigatorRoutesProps = NativeStackNavigationProp<AppRoutes>;

const Tab = createBottomTabNavigator<HomeTabNavigationProps>()
const Stack = createNativeStackNavigator<AppRoutes>()

function HomeTabNavigation() {
  const { sizes, colors } = useTheme();

  const iconSize = sizes[8];

  const { signOut } = useContext(AuthContext);

  return (
    <Tab.Navigator screenOptions={{ 
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: colors.gray[700],
      tabBarInactiveTintColor: colors.gray[300],
      tabBarStyle: {
        backgroundColor: colors.gray[100],
        borderTopWidth: 0,
        height: Platform.OS === "android" ? 'auto' : 96,
        paddingHorizontal: 16,
        paddingBottom: sizes[8],
        paddingTop: sizes[8],
        alignItems: 'center',
      }
    }}>
      <Tab.Screen
        name='home'
        component={Home}
        options={{
          tabBarIcon: ({color}) => (
            <House weight='bold' size={iconSize} color={color}/>
          )
        }}
      />
      <Tab.Screen
        name='myProducts'
        component={MyProducts}
        options={{
          tabBarIcon: ({color}) => (
            <Tag weight='bold' size={iconSize} color={color}/>
          )
        }}
      />
      <Tab.Screen 
        name='signOut'
        options={{
          tabBarButton: () => {
            return (
              <Pressable 
                onPress={signOut} 
                width={iconSize} 
                height={iconSize}
                justifyContent="center"
                alignItems="center"
                flexDirection="row"
                h="100%"
              >
                <SignOut weight='bold' size={iconSize} color={colors.red[300]}/> 
              </Pressable>
            )
          },
          tabBarItemStyle: {
            padding: 0,
            flex: 1,
            
          },
          tabBarStyle: {
            padding: 0,
            marginTop: -10,
          },

        }}
      >
        {(props) => (
          null
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function AppRoutes() {
  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: false, 
      animation: 'slide_from_right' 
    }}>
      <Stack.Screen
        name='homeTab'
        component={HomeTabNavigation}
      />
      <Stack.Screen
        name='product'
        component={Product}
        initialParams={{ isOwner: false }}
      />
      <Stack.Screen
        name='newProduct'
        component={CreateProduct}
      />

      <Stack.Screen
        name='previewProduct'
        component={PreviewProduct}
      />
    </Stack.Navigator>
  )
}

{/*import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'

import { SecondaryAppRoutes } from '@routes/secondary.app.routes';

import { Adverts } from '@screens/Adverts';
import { CreateAdverts } from '@screens/CreateAdverts';
import { PreviewAdverts } from '@screens/PreviewAdverts';
import { MyProduct } from '@screens/MyProduct';
import { EditAdverts } from '@screens/EditAdverts';
import { PreviewEditAdverts } from '@screens/PreviewEditAdverts';

type AppRoutes = {
  adverts: { id: string };
  myProduct: { id: string };
  createAdverts: undefined;
  
  editAdverts: {
    title: string
    description: string
    price: string
    images: any[]
    paymentMethods: string[]
    isNew: boolean
    acceptTrade: boolean
    id: string
  }

  previewAdverts: {
    title: string
    description: string
    price: string
    images: any[]
    paymentMethods: string[]
    isNew: boolean
    acceptTrade: boolean
  }

  previewEditAdverts: {
    title: string
    description: string
    price: string
    images: any[]
    paymentMethods: string[]
    isNew: boolean
    acceptTrade: boolean
    id: string
  }

  app: {
    screen: 'myAdverts' | 'home' | 'signOut'
  };
}

const { Navigator, Screen } = 
  createNativeStackNavigator<AppRoutes>();

export type AppNavigatorRoutesProps = NativeStackNavigationProp<AppRoutes>

export const AppRoutes = () => {
  return (
    <Navigator screenOptions={{ headerShown: false }} 
      initialRouteName="app">
      <Screen name="adverts" component={Adverts} />
      <Screen name='myProduct' component={MyProduct}/>
      <Screen name='editAdverts' component={EditAdverts} />
      <Screen name='createAdverts' component={CreateAdverts} />
      <Screen name='previewAdverts' component={PreviewAdverts} />
      <Screen name="previewEditAdverts" component={PreviewEditAdverts} />
      <Screen name="app" component={SecondaryAppRoutes} />
    </Navigator>
  )
}

*/}