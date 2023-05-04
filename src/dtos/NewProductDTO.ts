export interface NewProductDTO {
  id: string
  name: string
  description: string
  price: number
  is_new: boolean
  accept_trade: boolean
  payment_methods: string[]
  product_images: any[]
  product_images_to_delete?: string[]
  user: {
    avatar: string
    name: string
    tel: string
  }
}
