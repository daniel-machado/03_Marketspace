export interface MyProductDTO {
  id?: string
  name: string
  description: string
  price: number
  accept_trade: boolean
  is_active?: boolean
  is_new: boolean
  payment_methods: [{
    key: string
    name: string
  }]
  product_images: [{
    id: string, 
    path: string
  }]
  user: {
    avatar: string
    name: string 
    tel: string
  }
}