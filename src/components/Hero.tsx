import Link from 'next/link';
import { Container } from './layout/Container';
import { Section } from './layout/Section';
import { Button } from './ui/Button';

interface HeroProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export const Hero = ({
  title = 'Stefano - Twoja Włoska Restauracja',
  description = 'Odkryj autentyczne smaki Italii w sercu miasta. Nasza pasja do gotowania i świeże składniki tworzą niezapomniane doznania kulinarne.',
  primaryButtonText = 'Zobacz menu',
  primaryButtonLink = '/menu',
  secondaryButtonText = 'Zarezerwuj stolik',
  secondaryButtonLink = '/rezerwacja',
}: HeroProps) => {
  return (
    <Section className="relative isolate overflow-hidden bg-gray-900">
      <img
        src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center"
      />
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">{description}</p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold leading-7 text-white sm:grid-cols-2 md:flex lg:gap-x-10">
            <Link href={primaryButtonLink}>
              <Button>{primaryButtonText}</Button>
            </Link>
            <Link href={secondaryButtonLink}>
              <Button variant="outline">{secondaryButtonText}</Button>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
};
