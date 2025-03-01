import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import styled from 'styled-components';
import './App.css';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const OptGroup = styled.optgroup`
  font-weight: 600;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #3a7bc8;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const FileUploadInfo = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
`;

const SummaryContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f0f7ff;
  border-radius: 8px;
  border: 1px solid #d0e3ff;
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SummaryItem = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SummaryLabel = styled.span`
  font-weight: 600;
  color: #555;
  margin-right: 0.5rem;
`;

const SummaryValue = styled.span`
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const BackButton = styled(Button)`
  background-color: #9e9e9e;
  &:hover {
    background-color: #757575;
  }
`;

interface RiskIndicatorProps {
  risk: string;
}

const RiskIndicator = styled.div<RiskIndicatorProps>`
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  background-color: ${(props) => {
    switch (props.risk) {
      case 'High':
        return '#ffebee';
      case 'Mid':
        return '#fff8e1';
      case 'Normal':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${(props) => {
    switch (props.risk) {
      case 'High':
        return '#c62828';
      case 'Mid':
        return '#f57f17';
      case 'Normal':
        return '#2e7d32';
      default:
        return '#616161';
    }
  }};
`;

interface Country {
  name: string;
  risk: string;
}

interface Continent {
  name: string;
  countries: Country[];
}

const continents: Continent[] = [
  {
    name: 'Africa',
    countries: [
      { name: 'South Africa', risk: 'High' },
      { name: 'Egypt', risk: 'High' },
      { name: 'Kenya', risk: 'High' },
    ],
  },
  {
    name: 'Asia',
    countries: [
      { name: 'China', risk: 'Mid' },
      { name: 'Japan', risk: 'Mid' },
      { name: 'South Korea', risk: 'Mid' },
    ],
  },
  {
    name: 'North America',
    countries: [
      { name: 'United States', risk: 'Normal' },
      { name: 'Canada', risk: 'Normal' },
    ],
  },
  {
    name: 'Europe',
    countries: [
      { name: 'United Kingdom', risk: 'Normal' },
      { name: 'Germany', risk: 'Normal' },
      { name: 'France', risk: 'Normal' },
      { name: 'Italy', risk: 'Normal' },
    ],
  },
];

const App: React.FC = () => {
 
  const [country, setCountry] = useState<string>('');
  const [risk, setRisk] = useState<string>('');
  const [deposit, setDeposit] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  
  const [depositError, setDepositError] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    
    if (selectedCountry) {
      for (const continent of continents) {
        const countryData = continent.countries.find(c => c.name === selectedCountry);
        if (countryData) {
          setRisk(countryData.risk);
          break;
        }
      }
    } else {
      setRisk('');
    }
  };
  
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeposit(value);
    
    const depositAmount = parseFloat(value);
    if (isNaN(depositAmount)) {
      setDepositError('Please enter a valid number');
    } else if (depositAmount < 20000) {
      setDepositError('Deposit amount must be at least 20,000');
    } else if (depositAmount > 50000) {
      setDepositError('Deposit amount cannot exceed 50,000');
    } else {
      setDepositError('');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setFileError('Please upload an image (JPEG, PNG, GIF) or PDF file');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError('File size should not exceed 5MB');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setFileError('');
    } else {
      setFile(null);
    }
  };
  
  const handleCaptchaChange = (token: string | null) => {
    setCaptchaVerified(!!token);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    
    if (!file) {
      setFileError('Proof of address is required');
      isValid = false;
    }
    
    if (!captchaVerified) {
      alert('Please complete the CAPTCHA verification');
      isValid = false;
    }
    
    if (!country) {
      alert('Please select a country');
      isValid = false;
    }
    
    const depositAmount = parseFloat(deposit);
    if (isNaN(depositAmount) || depositAmount < 20000 || depositAmount > 50000) {
      setDepositError('Deposit amount must be between 20,000 and 50,000');
      isValid = false;
    }
    
    if (isValid) {
     
      setShowConfirmation(true);
    }
  };
  
  const handleFinalSubmit = () => {
    
    alert('Form submitted successfully!');
    console.log({
      country,
      risk,
      deposit: parseFloat(deposit),
      file,
      captchaVerified
    });
    
    setCountry('');
    setRisk('');
    setDeposit('');
    setFile(null);
    setCaptchaVerified(false);
    setShowConfirmation(false);
    
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };
  
  const handleBackToEdit = () => {
    setShowConfirmation(false);
  };
  
  return (
    <FormContainer>
      <FormTitle>KYC Form</FormTitle>
      
      {!showConfirmation ? (
       
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="country">Country</Label>
            <Select 
              id="country" 
              value={country} 
              onChange={handleCountryChange}
              required
            >
              <option value="">Select a country</option>
              {continents.map((continent) => (
                <OptGroup key={continent.name} label={continent.name}>
                  {continent.countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </OptGroup>
              ))}
            </Select>
            {risk && <RiskIndicator risk={risk}>Risk Level: {risk}</RiskIndicator>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="deposit">Deposit Amount (20,000 - 50,000)</Label>
            <Input
              type="number"
              id="deposit"
              value={deposit}
              onChange={handleDepositChange}
              min="20000"
              max="50000"
              required
            />
            {depositError && <ErrorMessage>{depositError}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="proofOfAddress">Proof of Address</Label>
            <Input
              type="file"
              id="proofOfAddress"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              required
            />
            <FileUploadInfo>
              Accepted formats: JPEG, PNG, GIF, PDF (Max size: 5MB)
            </FileUploadInfo>
            {fileError && <ErrorMessage>{fileError}</ErrorMessage>}
            {file && <FileUploadInfo>File selected: {file.name}</FileUploadInfo>}
          </FormGroup>
          
          <FormGroup>
            <Label>CAPTCHA Verification</Label>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" 
              onChange={handleCaptchaChange}
            />
          </FormGroup>
          
          <Button 
            type="submit" 
            disabled={!captchaVerified || !file || !!depositError || !country}
          >
            Review Information
          </Button>
        </form>
      ) : (
        
        <div>
          <SummaryContainer>
            <SummaryTitle>Please Confirm Your Information</SummaryTitle>
            
            <SummaryItem>
              <SummaryLabel>Country:</SummaryLabel>
              <SummaryValue>{country}</SummaryValue>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>Risk Level:</SummaryLabel>
              <RiskIndicator risk={risk}>{risk}</RiskIndicator>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>Deposit Amount:</SummaryLabel>
              <SummaryValue>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2
                }).format(parseFloat(deposit))}
              </SummaryValue>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>Proof of Address:</SummaryLabel>
              <SummaryValue>{file?.name}</SummaryValue>
              <FileUploadInfo>
                File type: {file?.type}, Size: {(file?.size ? (file.size / (1024 * 1024)).toFixed(2) : 0)} MB
              </FileUploadInfo>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>CAPTCHA Verification:</SummaryLabel>
              <SummaryValue>Completed</SummaryValue>
            </SummaryItem>
          </SummaryContainer>
          
          <ButtonGroup>
            <BackButton type="button" onClick={handleBackToEdit}>
              Back to Edit
            </BackButton>
            <Button type="button" onClick={handleFinalSubmit}>
              Confirm & Submit
            </Button>
          </ButtonGroup>
        </div>
      )}
    </FormContainer>
  );
};

export default App;
