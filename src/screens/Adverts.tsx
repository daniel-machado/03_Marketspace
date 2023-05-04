import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Box, Center, Heading, ScrollView, Select, Icon, Pressable, HStack, Text, CheckIcon } from 'native-base'
import { MaterialIcons } from '@expo/vector-icons'

import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Card } from '@components/Card'

export function Ad() {
  const [service, setService] = useState('Todos')

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleCreateAd() {
    navigation.navigate('createAdverts')
  }

  function handleGoDetails() {
    //navigation.navigate('detailsProduct');
  }

  return(
    <ScrollView bg='gray.700' showsVerticalScrollIndicator={false}>
      <Box safeArea mt={3} px={6}>
        <HStack alignItems='center' mb='10'>
          <Center flex={1}>
            <Heading>
              Meus anúncios
            </Heading>
          </Center>

          <Pressable onPress={handleCreateAd}>
            <Icon 
              as={MaterialIcons}
              name='add'
              size={6}
              color='gray.100'
            />
          </Pressable>
        </HStack>

        <HStack mb='5' alignItems='center' justifyContent='space-between'>
          <Text fontSize={14} color='gray.200'>
            9 anúncios
          </Text>

          <Select selectedValue={service} h='34' w='111'
            onValueChange={itemValue => setService(itemValue)}
          >
            <Select.Item label='Todos' value='Todos' />
            <Select.Item label='Ativos' value='Ativos' />
            <Select.Item label='Inativos' value='Inativos' />
          </Select>
        </HStack>

        <Box 
          flexDirection='row' 
          flexWrap='wrap'
          justifyContent='space-between'
        >
          {/*
          <Card 
            //onPress={handleGoDetails} 
            //variant='old' 
            //stoped='yes' 
            />
          */}
          
        </Box>
      </Box>
    </ScrollView>
  )
}