import { HStack, 
  Icon, 
  Text
} from 'native-base'
import { FontAwesome } from '@expo/vector-icons'

interface PaymentIconsProps {
  id: string
  name: string
}

export function PaymentIcons({ id, name }: PaymentIconsProps) {
  
  function iconName(paymentType: string) {
    switch (paymentType) {
      case 'card':
        return 'credit-card'
      case 'deposit':
        return 'bank'
      case 'cash':
        return 'money'
      case 'pix':
        return 'qrcode'
      case 'boleto':
        return 'barcode'
      default:
        break
    }
  }

  return (
    <HStack 
      key={id} 
      mt={1} 
      alignItems='center'
    >
      <Icon 
        as={FontAwesome} name={iconName(id)}
        color='gray.200' size={4} mr={2}
      />
      <Text color="gray.200">
        {name}
      </Text>
    </HStack>
  )
}
