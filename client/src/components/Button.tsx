function Button({text, func}) {
  return (
    <div>
      <button onClick={func}>{text}</button>
    </div>
  )
}

export default Button