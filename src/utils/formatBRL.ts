export function formatBRL(number: number){
  const result = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number)

  return result;
}