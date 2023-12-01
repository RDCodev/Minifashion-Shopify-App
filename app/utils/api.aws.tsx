const URL_AWS = "https://92g0pm45ci.execute-api.us-east-2.amazonaws.com"

export const AWS_ENDPOINTS = {
  customersList: (appID: number) => `${URL_AWS}/recommend/customer/list?app_id=${appID}`,
}