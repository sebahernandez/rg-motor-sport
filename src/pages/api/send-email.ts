import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const keyCaptcha = import.meta.env.CAPTCHA_KEY;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, phone, message } = data;

    const recaptchaURL = "https://www.google.com/recaptcha/api/siteverify";
    const requestHeaders = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const requestBody = new URLSearchParams({
      secret: keyCaptcha, // Esto puede ser una variable de entorno
      response: data.recaptcha, // El token pasado desde el cliente
    });

    const response = await fetch(recaptchaURL, {
      method: "POST",
      headers: requestHeaders,
      body: requestBody.toString(),
    });

    const responseData = await response.json();

    const { data: emailData, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "sebaprogramer@gmail.com", // cambiar por el email de la empresa
      subject: `(Sitio web) Nuevo mensaje de contacto de ${name}`,
      html: `
        <h2>Nuevo mensaje de contacto sitio web</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message, responseData }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: emailData, responseData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
