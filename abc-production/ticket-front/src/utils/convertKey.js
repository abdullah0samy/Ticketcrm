const convertKey = (array) => {
    return array.map(({ id, name }) => {
        return { value: id, label: name }
    })
}

export default convertKey