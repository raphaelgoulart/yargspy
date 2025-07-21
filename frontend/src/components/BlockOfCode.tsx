import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import type { HTMLAttributes } from 'react'

SyntaxHighlighter.registerLanguage('js', js)
SyntaxHighlighter.registerLanguage('json', json)

export interface BlockOfCodeProps extends HTMLAttributes<HTMLElement> {
  code: string
}
export default function BlockOfCode({ code, ...props }: BlockOfCodeProps) {
  return (
    <SyntaxHighlighter language="json" style={a11yDark} codeTagProps={props}>
      {code}
    </SyntaxHighlighter>
  )
}
