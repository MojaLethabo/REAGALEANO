import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact us", description: "Request a quote or call back. 24-hour support on 062 375 0851." };

export default async function Contact({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  return (
    <section className="wrap sec">
      <h1>Contact us</h1>
      <p className="lead">Tell us what you need and we will call you back to arrange a site assessment.</p>
      <div className="two">
        <div>
          <div className="note w">Fault or emergency? Call or WhatsApp <b>062 375 0851</b>. A form is too slow for a stuck gate or a live alarm.</div>
          <ContactForm defaultService={service} />
        </div>
        <div>
          <h2>Prefer to talk?</h2>
          <div className="ways">
            <a href="tel:+27623750851"><b>Call 062 375 0851</b><span>24-hour support</span></a>
            <a href="https://wa.me/27623750851"><b>WhatsApp 062 375 0851</b><span>Send photos of the problem</span></a>
            <a href="mailto:admin@reagaleano.co.za"><b>admin@reagaleano.co.za</b><span>For quotes and general enquiries</span></a>
          </div>
          <h2 style={{ marginTop: 26 }}>What happens next</h2>
          <ol className="next"><li>We review your request.</li><li>We call you back.</li><li>We assess your site.</li><li>You receive a quote for the agreed scope.</li></ol>
        </div>
      </div>
    </section>
  );
}
