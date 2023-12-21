export function copyInnerText(node, text = '') {
  let loading = false
  function copyText() {
    if (loading) return
    loading = true
    let textarea = document.createElement('textarea')
    textarea.readOnly = true
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    textarea.value = text || node.innerText
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    textarea = null

    node.innerText = node.innerText + '(复制成功🎉)'

    setTimeout(() => {
      loading = false
      node.innerText = node.innerText.replace('(复制成功🎉)', '')
    }, 2000)

    return result
  }
  node.addEventListener('click', copyText)
  node.title = '点我复制'
  node.classList.add('copy-pointer')
  return {
    destroy() {
      node.removeEventListener('click', copyText)
    }
  }
}
