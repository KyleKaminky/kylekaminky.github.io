/*
   A framed element in the Industry system: a hairline border plus the four
   registration marks that draw the '+' crosshairs at its corners.

   The design system's rule is that the marks are never omitted from a framed
   element, so this component exists to make that impossible to get wrong.
*/

export default function Blueprint({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`blueprint ${className}`.trim()} {...rest}>
      {children}
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </Tag>
  );
}
