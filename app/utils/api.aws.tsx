const URL_AWS = "https://92g0pm45ci.execute-api.us-east-2.amazonaws.com"
const URL_AWS_REST = "https://p57o0cbin9.execute-api.us-east-2.amazonaws.com/MF-REST-Dev"

export const AWS_ENDPOINTS = {
  customersList: (appID: number) => `${URL_AWS}/recommend/customer/list?app_id=${appID}`,
  deliverEmails: () => `${URL_AWS_REST}/emails`
}

export const emailTemplateConfig = {
  Source: 'Minifashion Staff <rdcode.dev@gmail.com>',
  Template: 'MFTemplate09122023',
  Destination: {
    ToAddresses: [
      null
    ]
  },
  TemplateData: null
}