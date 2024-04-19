

const notificationEvents = {
  onEvents:{
    "notificar-compra": (socket, evento) => (compra) => {
      console.log("HA COMPRADO CREO")
      compra("Compra confirmada");
      console.log("e: ", evento)
      socket.to("admin").emit(evento)
    }
  }
}

export default notificationEvents;