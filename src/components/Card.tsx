import { useNavigation } from '@react-navigation/native'
import {Image, 
        Text, 
        HStack, 
        Box, 
        Pressable 
      } from 'native-base'

import { api } from '@services/api'
import { formatBRL } from '@utils/formatBRL'
import { ProductDTO } from '@dtos/ProductDTO'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { UserPhoto } from '@components/UserPhoto';

interface CardsProps {
  item: ProductDTO
}

export function Card({ item }: CardsProps) {

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleProductToBuy(id: string) {
    navigation.navigate('productToBuy', { productId: id })
  }

  return(
    <Pressable 
      w={150} h={140} mb={6} 
      onPress={() => handleProductToBuy(item.id!)}
    >
      <UserPhoto 
        source={{ uri: `${api.defaults.baseURL}/images/${item.user.avatar}` }}
        alt='User image'
        size={8}
        position='absolute' 
        top={2} 
        left={1} 
        zIndex={1}
      />
      
      <Box
        position='absolute'
        top={2}
        right={1}
        zIndex={10}
        backgroundColor={ item.is_new ? 'blue' : 'gray.200' }
        rounded='2xl'
        px={2}
        py={1}
      >
        <Text color='gray.700' fontSize={10} fontFamily='heading'>
          { item.is_new ? 'NOVO': 'USADO' }
        </Text>
      </Box>
      
      <Image 
        source={{ uri: `${api.defaults.baseURL}/images/${item.product_images[0].path}` }}
        alt='Imagem do produto'
        h={100}
        resizeMode='contain'
      />

      <Text color={'gray.300'} numberOfLines={1}>
        {item.name}
      </Text>

      <HStack alignItems='center'>
      <Text color={'gray.300'} fontFamily='heading' fontSize={16}>
        {formatBRL(item.price)}
      </Text>
      </HStack>
    </Pressable>
  )
}
