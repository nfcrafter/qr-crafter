import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function CardRedirect() {
    const { cardId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        navigate(`/u/${cardId}`, { replace: true })
    }, [cardId])

    return null
}