import {
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