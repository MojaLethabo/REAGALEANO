import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { company } from "@/lib/company";
import { telHref, whatsappHref } from "@/lib/phone";

export const metadata: Metadata = { title: "Contact us", description: "Request a quote or call back. 24-hour support on 062 375 0851." };

export default async function Contact({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const co = company();
  return (
    <section className="wrap sec">
      <h1>Contact us</h1>
      <p className="lead">Tell us what you need and we will call you back to arrange a site assessment.</p>
      <div className="two">
        <div>
          <div className="note w">Fault or emergency? Call or WhatsApp <b>{co.sitePhone}</b>. A form is too slow for a stuck gate or a live alarm.</div>
          <ContactForm defaultService={service} phone={co.sitePhone} />
        </div>
        <div>
          <h2>Prefer to talk?</h2>
          <div className="ways">
            <a href={telHref(co.sitePhone)}><b>Call {co.sitePhone}</b><span>24-hour support</span></a>
            <a href={whatsappHref(co.sitePhone)}><b>WhatsApp {co.sitePhone}</b><span>Send photos of the problem</span></a>
            <a href={`mailto:${co.siteEmail}`}><b>{co.siteEmail}</b><span>For quotes and general enquiries</span></a>
          </div>
          <h2 style={{ marginTop: 26 }}>What happens next</h2>
          <ol className="next"><li>We review your request.</li><li>We call you back.</li><li>We assess your site.</li><li>You receive a quote for the agreed scope.</li></ol>
        </div>
      </div>
    </section>
  );
}
