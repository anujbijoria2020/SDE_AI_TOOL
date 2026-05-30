// SQL View component


function SQLView({ sql }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(sql)
    alert("SQL copied to clipboard!")
  }

  return (
    <div className="sql-view">
      <div className="sql-header">
        <h2>SQL Schema</h2>
        <button className="copy-btn" onClick={handleCopy}>
          Copy SQL
        </button>
      </div>
      <pre className="sql-code">{sql}</pre>
    </div>
  )
}

export default SQLView