import { HStack, Text, VStack, Icon, Heading } from 'native-base'
import { MaterialIcons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native'

import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Button } from '@components/Button'
import { UserPhoto } from '@components/UserPhoto'

export function HomeHeader(){
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const { user } = useAuth();
  
  function handleCreateAd(){
    navigation.navigate('createAdverts')
  }
  return (
    <HStack w="100%" justifyContent="space-between">
      <HStack>
        <UserPhoto
          source={{ uri: `${api.defaults.baseURL}/images/${user.avatar}` }}
          alt='Imagem do usuário'
          size={45}
          mr={3}
        />

        <VStack w={140} mr={5}>
          <Text 
            lineHeight="sm" 
            fontFamily='body' 
            fontSize='md'
          >
            Boas vindas,
          </Text>
          
          <Text 
            lineHeight="sm" 
            fontFamily='heading' 
            fontSize='md'
          >
            { user.name }!
          </Text>
        
        </VStack>
      </HStack>

      <Button
        title='Criar anúncio'
        flex={1}
        variant='terceary'
        leftIcon={
          <MaterialIcons 
            name="add" 
            size={24} 
            color="white" 
          />
        }
        onPress={handleCreateAd}
      />
    </HStack>
  )
}