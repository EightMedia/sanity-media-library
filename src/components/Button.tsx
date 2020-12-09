import { Icon } from './Icon'
import { iconTypes } from '../types/iconTypes'
import React from 'react'
import styled from 'styled-components'

type Props = {
  children: React.ReactNode,
  grow?: Boolean,
  icon?: iconTypes,
  onClick: (event: React.MouseEvent) => void,
  secondary?: Boolean,
}

const StyledButton = styled.button<{ grow?: Boolean, secondary?: Boolean }>`
  background-color: ${({ secondary }) => secondary ? 'transparent' : '#FFE900'};
  border-radius: 2px;
  border: solid 1px ${({ secondary }) => secondary ? '#666' : '#FFE900'};
  box-sizing: border-box;
  cursor: pointer;
  color:${({ secondary }) => secondary ? '#666' : '#000'};
  font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.1;
  padding: 12px 16px;
  width: ${({ grow }) => grow ? '100%' : 'auto'}
`

const StyledButtonInner = styled.span<{ grow?: Boolean }>`
  align-items: center;
  display: flex;
  justify-content: ${({ grow }) => grow ? 'center' : 'flex-start'};

  & svg {
    height: 20px;
    margin-right: 10px;
    width: 20px;
  }
`

export const Button = ({ children, grow, icon, onClick, secondary }: Props) => (
  <StyledButton grow={grow} onClick={onClick} secondary={secondary}>
    <StyledButtonInner grow={grow}>
      {icon && <Icon type={icon} />}
      {children}
    </StyledButtonInner>
  </StyledButton>
)