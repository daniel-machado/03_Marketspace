import { VStack, IStackProps, Image, Text, Heading, Box } from 'native-base'
import { TouchableOpacity } from 'react-native'

import { useNavigation } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

type Props = IStackProps & {
  title: string
  price: string
  used: boolean
  active: boolean
  image: string
  id: string
  showProfile?: boolean
  profileImage?: string
}

export const Card = ({
  title,
  price,
  used,
  active = true,
  image,
  profileImage,
  showProfile = false,
  id,
  ...rest
}: Props) => {

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const handleGoMyAd = () => {
    if (showProfile) {
      navigation.navigate('adverts', { id })
    } else {
      navigation.navigate('myProduct', { id })
    }
  }

  return (
    <TouchableOpacity onPress={handleGoMyAd}>
      <VStack position="relative" {...rest} mt={2}>
        <Box
          bg={!used ? 'blue.default' : 'gray.200'}
          position="absolute"
          zIndex={100}
          borderRadius={10}
          py={1}
          px={2}
          right={1}
          top={1}
          opacity={active ? 100 : 50}
        >
          <Heading
            textTransform="uppercase"
            color="white"
            fontSize={10}
            fontFamily="heading"
          >
            {used ? 'Usado' : 'Novo'}
          </Heading>
        </Box>

        <Box position="relative" alignItems="center" justifyContent="center">
          {!active && (
            <Box
              position="absolute"
              zIndex={100}
              w={160}
              bg="#1A181B99"
              height={100}
              borderRadius={6}
              justifyContent="flex-end"
              alignItems="flex-start"
            >
              <Heading
                textTransform="uppercase"
                color="white"
                fontSize="xs"
                textAlign="center"
                fontFamily="heading"
                m={2}
              >
                Anúncio Desativado
              </Heading>
            </Box>
          )}

          {showProfile && (
            <Image
              h={8}
              w={8}
              source={{
                uri: profileImage,
              }}
              alt={title}
              borderRadius="full"
              position="absolute"
              zIndex={100}
              left={1}
              top={1}
              borderWidth={2}
              borderColor="white"
            />
          )}
          <Image
            h="24"
            w="lg"
            source={{
              uri: image,
            }}
            alt={title}
            resizeMode="cover"
            borderRadius={10}
            blurRadius={active ? 0 : 10}
          />
        </Box>

        <Text
          color={active ? 'gray.200' : 'gray.400'}
          fontSize={14}
          mt={1}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Heading
          color={active ? 'gray.200' : 'gray.400'}
          fontSize={14}
          fontFamily="heading"
        >
          R$ {price}
        </Heading>
      </VStack>
    </TouchableOpacity>
  )
}