import { useState } from "react";
import { GoChevronRight } from "react-icons/go";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0;
`;

const ToggleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  color: inherit;
  text-align: left;
  flex: 1;
`;

const ChevronIcon = styled(GoChevronRight)`
  transition: transform 0.2s ease;
  transform: ${({ $open }) => ($open ? "rotate(90deg)" : "rotate(0deg)")};
  flex-shrink: 0;
`;

const ArrowBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0.2rem;
  font-size: inherit;
  color: inherit;
  line-height: 1;
`;

const Content = styled.div`
  padding-left: 1.1rem;
`;

export default function Dropdown({ label, onArrow, children }) {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <Header>
        <ToggleBtn type="button" onClick={() => setOpen((o) => !o)}>
          <ChevronIcon $open={open} />
          {label}
        </ToggleBtn>
        {onArrow && (
          <ArrowBtn type="button" onClick={onArrow}>
            &rarr;
          </ArrowBtn>
        )}
      </Header>
      {open && <Content>{children}</Content>}
    </Wrapper>
  );
}
