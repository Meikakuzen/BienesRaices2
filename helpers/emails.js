import nodemailer from 'nodemailer'



export const emailRegistro = async(datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const {email, nombre, token} = datos

      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: "Email de confirmación en BienesRacies.com",
        text: "Confirma tu cuenta",
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>
            <p>Tu cuenta ya esta lista, sólo debes confirmarla en el siguiente enlace: </p>

            <a href="${process.env.BACKEND_URL}:${process.env.PORT || 4000}/auth/confirmar/${token}">Confirmar cuenta</a>

            <p>Si tu no creaste esta cuenta puedes ignorar el mensaje</p>
        `
      })
}