/** @type {import('pika').RequestHandler} */
export async function get({ request, params }) {
  return new Response(JSON.stringify('$repo responses'), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}
