export const emailTemplates = {
  //TODO: OPCIONAL > PARAMETRO PARA COLOCAR IMAGENES EN EL CORREO
  correoVerificacion: (codigo) => {
    return (
      `
          <html>
            <head>
              <style>
                .container{
                  padding: 10px;
                  width: 100%;
                  text-align: center;
                  background-color: #E7E3E7;
                }
                
                p{
                  font-size: 30px;
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <p style="color: #375264;">Su codigo de verificación: </p>
                <br/>
                <p style="color: #2a7389;">${codigo}</p>
              </div>
            </body>
          </html>
        `
    )
  }
}