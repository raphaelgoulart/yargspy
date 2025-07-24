import type { ButtonHTMLAttributes } from 'react'
import { ImCheckboxChecked, ImCheckboxUnchecked } from '../assets/icons'

export interface CheckBoxProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  condition: boolean
}

export default function CheckBox({ condition, ...props }: CheckBoxProps) {
  return <button {...props}>{condition ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}</button>
}
