const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(0),
  poster: z.string().url().endsWith('.jpg'),
  genre: z.array(z.string())
})

function validateMovie (object) {
  return movieSchema.safeParse(object) // devuelve si hay error o no (true o false)
}

/**
 * El partial lo que hace es hacer que todas las validaciones sean opcionales
 * cuestion de que si está la valida y sino no pasa nada
 */
function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = { validateMovie, validatePartialMovie }
