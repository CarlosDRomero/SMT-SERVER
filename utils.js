export const multiInsertFactory = (query, dataMatrix, returning = true) => {
  console.log(dataMatrix)
  const dataMatrixLM = dataMatrix.length
  for (let i = 0;i < dataMatrixLM ; i++){
    query.text += " ("
    const subDataMatrixLM = dataMatrix[i].length
    for (let j = 0; j < subDataMatrixLM; j++){
      query.values.push(dataMatrix[i][j])
      query.text += `$${query.values.length}`

      if (j < subDataMatrixLM - 1) query.text += ", "
    }
    query.text += ")"
    if (i < dataMatrixLM - 1) query.text += ","
  }

  if (returning) query.text += " RETURNING *";
}

