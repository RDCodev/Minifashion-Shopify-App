export const capatilize = (str: string) => {

  if(!str) return

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const dotReplace = (str: string, maxLength: number = 10) => {
  if(!str) return
  
  return str.substring(0, maxLength) + " ..."
}