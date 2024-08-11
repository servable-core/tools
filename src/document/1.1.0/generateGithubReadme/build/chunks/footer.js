
export default async props => {

  const payload = []

  payload.push({
    h2: 'Resources'
  })

  payload.push({
    h3: 'Servable Documentation'
  })
  payload.push({
    p: 'You can find here the complete [servable documentation](https://docs.servable.app/) with guides and api reference.'
  })

  payload.push({
    h3: 'Servable Registry'
  })
  payload.push({
    p: 'You can find other Servable  protocols at the [Servable registry](https://servable.app/)'
  })


  payload.push({
    h3: 'License'
  })
  payload.push({
    p: 'MIT © [servable-core](https://github.com/servable-core)'
  })

  return { payload, name: 'Footer', id: 'footer', }
}
