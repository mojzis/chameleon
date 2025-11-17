import { useState, useEffect } from 'react'

interface HelpButtonProps {
  onHelpClick: () => void
  helpRemaining: number
  disabled?: boolean
}

export default function HelpButton({
  onHelpClick,
  helpRemaining,
  disabled = false,
}: HelpButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        onHelpClick()
        setIsPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onHelpClick])

  const handleClick = () => {
    if (!disabled && helpRemaining > 0) {
      onHelpClick()
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 200)
    }
  }

  const isDisabled = disabled || helpRemaining === 0

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        position: 'absolute',
        bottom: '40px',
        right: '40px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        border: '4px solid #F4C430',
        backgroundColor: isDisabled ? '#CCCCCC' : '#F4C430',
        color: isDisabled ? '#888888' : '#2C3E50',
        fontSize: '18px',
        fontFamily: "'Quicksand', sans-serif",
        fontWeight: 'bold',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: isPressed
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 4px 16px rgba(244, 196, 48, 0.4)',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        opacity: isDisabled ? 0.5 : 1,
        zIndex: 1000,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'scale(1.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled && !isPressed) {
          e.currentTarget.style.transform = 'scale(1)'
        }
      }}
    >
      <div style={{ fontSize: '28px' }}>?</div>
      <div style={{ fontSize: '14px', lineHeight: '1' }}>
        Help
        <br />
        <span style={{ fontSize: '12px' }}>({helpRemaining}/3)</span>
      </div>
      <div style={{ fontSize: '10px', opacity: 0.8 }}>Press H</div>
    </button>
  )
}
