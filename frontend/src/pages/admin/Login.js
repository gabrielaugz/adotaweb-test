import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const nav = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    try {
      const base = window.location.origin          // pega https://adotaweb-test-1.onrender.com
        const res  = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || res.statusText)
      }
      const { token } = await res.json()
      localStorage.setItem('token', token)
      nav('/admin')          // redireciona para a área administrativa
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-page">
      <h1>Login da ONG</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input
            type="email" required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>
        <label>
          Senha (CNPJ sem pontos/traços)
          <input
            type="password" required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
