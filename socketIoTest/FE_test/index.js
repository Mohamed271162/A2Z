const baseUrl = `http://localhost:3000`
const clientIo = io(baseUrl)

// send message from front-end to back-end
clientIo.emit('frontToBack', {
  destIds: [localStorage.getItem('destId1'), localStorage.getItem('destId2')],
})

clientIo.on('backtofront', (data) => console.log(data))
