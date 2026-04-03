import React from "react";
import HeadAdminNavbar from "../../components/Navbar/HeadAdminNavbar";
import styled from "styled-components";

/* =========================
   STYLES
========================= */

const Page = styled.div`
  background: #f8fafc;
  min-height: 100vh;
`;

const Content = styled.div`
  padding: 24px 40px;
`;

const TitleBar = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 10px;
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 30px;
`;

const Card = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
`;

/* =========================
   COMPONENT
========================= */

export default function HeadAdminCreateOrder() {
  return (
    <Page>
      {/* Navbar */}
      <HeadAdminNavbar />

      <Content>
        {/* Title Bar */}
        <TitleBar>Dashboard / Orders / Create Order</TitleBar>

        {/* Main Heading */}
        <Heading>Create Order</Heading>

        {/* Card Section */}
        <Card>
          {/* Your Form Starts Here */}
          <p style={{ color: "#64748b" }}>
            Fill the details below to create a new installation order.
          </p>

          {/* TODO: Add Form Fields Here */}
        </Card>
      </Content>
    </Page>
  );
}