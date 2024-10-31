import { PdfReader } from "pdfreader"

export function readPdf(file: string): Promise<string[]> {
  return new Promise(resolve => {
    const result: string[] = []
    new PdfReader().parseFileItems(file, (err, item) => {
      if (err) console.error("error:", err)
      else if (item?.text) {
        // console.log('item', item)
        result.push(item.text ?? '?')
      }
      else if (!item) {
        resolve(result)
      }
    })
  })
}
