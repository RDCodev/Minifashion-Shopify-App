export const capatilize = (str: string) => {

  if(!str) return

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const dotReplace = (str: string, maxLength: number = 10) => {
  if(!str) return
  
  return str.substring(0, maxLength) + " ..."
}

export const addHours = (date: any, hours: any) => {

  return date.setHours(date.getHours() + hours)
}

export const flat = (obj: any, out: any): any => {
  Object.keys(obj).forEach(key => {
      if (typeof obj[key] == 'object') {
          out = flat(obj[key], out) //recursively call for nesteds
      } else {
          out[key] = obj[key] //direct assign for values
      }

  })
  return out
}

export const chuckArray = (arr: any[], chunkSize: number) => {
  return arr.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/chunkSize)
  
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }
  
    resultArray[chunkIndex].push(item)
  
    return resultArray
  }, [])
}