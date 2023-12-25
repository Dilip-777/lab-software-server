import { PrintSetting, Signs } from "@prisma/client";

interface Props {
  patient: any;
  departments: any[];
  printSetting:
    | (PrintSetting & {
        signs: Signs[];
      })
    | null;
  departmentwise: {
    packages: any[];
    profiles: any[];
    tests: any[];
    name: string;
  }[];
}

const getnote = (note: string) => {
  const retrievedText = note.replace(/\n/g, "<br>");
  return retrievedText;
};

const getReferenceValue = (test: any, patient: any) => {
  const r = test.referencesValues.find(
    (ref: any) =>
      patient && ref.minAge <= patient?.age && ref.maxAge >= patient?.age
  );
  if (r)
    return (
      getnote(r.note || "") || `${r.lowerValue} - ${r.upperValue} ${r.unit}`
    );
  else if (test.referencesValues.length > 0)
    return (
      getnote(test.referencesValues[0].note || "") ||
      `${test.referencesValues[0].lowerValue} - ${test.referencesValues[0].upperValue} ${test.referencesValues[0].unit}`
    );
  else return "-";
};

export const generateReportHtml = ({
  patient,
  departments,
  printSetting,
  departmentwise,
}: Props) => {
  const signs = `
        <div style="font-size: 12px; display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; position: relative;   max-width: 100%;  font-family: 'Poppins', sans-serif; margin: 0;page-break-after: always;break-inside: avoid;">
          ${printSetting?.signs
            .map(
              (department) => `
              <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="http://localhost:5000/uploadedFiles/${department.signature}" style="width: 100px; height: 100px; object-fit: contain;"/>
                <p style="font-size: 12px; font-weight: bold;">${department.doctorname}</p>
              </div>
              `
            )
            .join("")}
        </div>`;

  const testTable = (test: any, g?: boolean) => {
    return `
   <div style="font-family: 'Poppins', sans-serif;font-size: 12px;margin-top: 5px;${
     g && printSetting?.testnewpage && "page-break-after: always;"
   }">
        <div style="display: grid;grid-template-columns: repeat(11, 1fr);width: 100%;">
            <div style="grid-column: 1 / 5;padding: 0;">
                <p style="margin: 0;">${test.name}</p>
                <p style="font-size:10px; margin-top:0;">${
                  test.testmethodtype || test.test.testmethodtype || ""
                }</p>
            </div>
            <p style="grid-column: 5 / 7;margin: 0;font-weight: ${
              test.highlight === " High" || test.highlight === "Low"
                ? "bold"
                : "normal"
            } ">${test.observedValue}</p>
                   <p style=" grid-column: 7 / 8;margin: 0; font-weight: ${
                     test.bold ? "bold" : "normal"
                   }">${test.highlight || "-"}</p>
            <p style=" text-align: left;margin: 0;grid-column: 8 /9;">${
              test.sampleunit || "-"
            }</p>
            <p style=" text-align: left;margin: 0;grid-column: 9 / 12;">${getReferenceValue(
              test.test,
              patient
            )}</p>

        </div>
        <div style="padding-right: 30px;break-inside: avoid;margin-bottom: 5px;">
        <p style="break-inside: avoid;margin-top: 0;margin-right: 30px;">
                ${test.test.note || ""}
        </p>
        </div>
    </div>      
    `;
  };

  const profileTable = (profile: any) => {
    return `
    <div style="${
      printSetting?.profilenewpage && "page-break-after: always; "
    }">
         <p style="font-size: 14px;font-family: 'Poppins', sans-serif;"><strong>${
           profile.name
         }</strong></p>
        
        ${profile.headings
          .filter(
            (heading: any) =>
              heading.tests.filter((test: any) => test.observedValue).length > 0
          )
          .map(
            (heading: any) => `
       
            <p style="padding-left:0px; text-align: left; font-size: 13px; font-weight: bold;font-family: 'Poppins', sans-serif;">${
              heading.heading
            }</p>
        ${heading.tests
          .filter((test: any) => test.observedValue)
          .map((test: any) => testTable(test))
          .join("")}
        `
          )
          .join("")}


        ${profile.tests
          .filter((test: any) => test.observedValue)
          .map((test: any) => testTable(test))
          .join("")}
       </div>   
    `;
  };

  const packageTable = (pkg: any) => {
    return `
    <div style="font-size: 12px; position: relative;max-width: 100%; font-family: 'Poppins', sans-serif; margin: 0;">
        <div style=" ">              
                    <p style="font-size: 15px;font-weight: bolder;">${
                      pkg.name
                    }</p>
                    ${pkg.profiles
                      .map((profile: any) => profileTable(profile))
                      .join("")}
                      <div style=" width: 100%;margin-top: 0px;"></div>
                      ${pkg.tests.map((test: any) => testTable(test)).join("")}
           
        </div>
       
    </div>
    </div>`;
  };

  let combinedHtml = "";

  departmentwise.forEach((department, index) => {
    const d = departments.find((d) => d.name === department.name);
    combinedHtml += `
      <div style="font-size: 12px;padding-left: 3px;page-break-after: always; position: relative;  max-width: 100%;  font-family: 'Poppins', sans-serif; margin: 0;">
             
                      ${
                        department.name
                          ? `<p style="font-size: 15px;font-weight: bolder;margin-bottom: 1rem;text-align:center;">${department.name}</p>`
                          : ""
                      }
                      ${department.packages
                        .map((pkg) => packageTable(pkg))
                        .join("")}
                        <div style=" width: 100%;margin-top: 5px;${
                          printSetting?.profilenewpage &&
                          department.packages.length > 0 &&
                          "page-break-after: always;"
                        }"></div>
                        ${
                          printSetting?.profilefirst
                            ? department.profiles
                                .map((profile) => profileTable(profile))
                                .join("")
                            : department.tests
                                .map((test) => testTable(test, true))
                                .join("")
                        }
                        <div style=" width: 100%;margin-top: 5px;${
                          printSetting?.testnewpage &&
                          department.profiles.length > 0 &&
                          department.tests.length > 0 &&
                          !printSetting?.profilenewpage &&
                          "page-break-after: always;"
                        }"></div>
                        ${
                          printSetting?.profilefirst
                            ? department.tests
                                .map((test) => testTable(test, true))
                                .join("")
                            : department.profiles
                                .map((profile) => profileTable(profile))
                                .join("")
                        }
                        
                       
         ${
           index === departmentwise.length - 1 &&
           printSetting?.showendline &&
           printSetting.endlineposition === "false"
             ? `<p style='text-align: center; margin-top: 1rem; font-size: 12px; font-weight: bold; grid-column: 1'>${
                 printSetting.endline
               }</p>
                ${printSetting.commonsigns ? signs : ""}`
             : ""
         }
         ${
           d && printSetting?.departmentwisesigns
             ? `   <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="http://localhost:5000/uploadedFiles/${d.doctorSignature}" style="width: 100px; height: 100px; object-fit: contain;"/>
                <p style="font-size: 12px; font-weight: bold;">${d.doctor}</p>
              </div>`
             : ``
         }

       
      </div>`;
  });

  // packages
  //   .filter(
  //     (p) =>
  //       selected &&
  //       selected.find((s) => s.type === "package" && s.name === p.name)
  //   )
  //   .forEach((pkg) => {
  //     combinedHtml += `
  //   <div style="font-size: 12px; position: relative;page-break-after: always; pb-10; background-size: contain; max-width: 100%; background-repeat: no-repeat; font-family: 'Poppins', sans-serif; margin: 0;">
  //       <div style=" ">
  //                   <p style="font-size: 15px;font-weight: bolder;">${
  //                     pkg.name
  //                   }</p>
  //                   ${pkg.profiles
  //                     .map((profile) => profileTable(profile))
  //                     .join("")}
  //                     <div style=" width: 100%;margin-top: 5px;"></div>
  //                     ${pkg.tests.map((test) => testTable(test)).join("")}

  //       </div>

  //   </div>
  //   ${
  //     profiles.filter(
  //       (p) =>
  //         selected &&
  //         selected.find((s) => s.type === "profile" && s.name === p.name)
  //     ).length === 0 &&
  //     tests
  //       .filter(
  //         (p) =>
  //           !selected ||
  //           selected.find((s) => s.type === "test" && s.name === p.name)
  //       )
  //       .filter((test) => test.observedValue).length === 0
  //       ? signs
  //       : ""
  //   }
  //   </div>`;
  //   });

  // profiles
  //   .filter(
  //     (p) =>
  //       selected &&
  //       selected.find((s) => s.type === "profile" && s.name === p.name)
  //   )
  //   .forEach((profile, index) => {
  //     combinedHtml += `
  //           <div
  //   style="font-size: 12px; position: relative;${
  //     printSetting?.profilenewpage ||
  //     (!printSetting?.testprofilesamepage &&
  //       index ===
  //         profiles.filter(
  //           (p) =>
  //             selected &&
  //             selected.find((s) => s.type === "profile" && s.name === p.name)
  //         ).length -
  //           1)
  //       ? "page-break-after: always;"
  //       : ""
  //   }  background-size: contain; max-width: 100%; background-repeat: no-repeat; padding-bottom: 0rem; font-family: 'Poppins', sans-serif; margin: 0;">
  //   <div style=" ">

  //   ${profileTable(profile)}
  //       </div>
  //       <div style="border-top: 1px solid black; width: 100%;margin-top: 0.5rem;"></div>
  //       ${
  //         tests
  //           .filter(
  //             (p) =>
  //               !selected ||
  //               selected.find((s) => s.type === "test" && s.name === p.name)
  //           )
  //           .filter((test) => test.observedValue).length === 0
  //           ? signs
  //           : ""
  //       }
  //       </div>
  //   </div>
  //       `;
  //   });

  // tests
  //   .filter(
  //     (p) =>
  //       !selected ||
  //       selected.find((s) => s.type === "test" && s.name === p.name)
  //   )
  //   .filter((test) => test.observedValue)
  //   .forEach((test, index) => {
  //     combinedHtml += `
  //          <div style="font-size: 12px; position: relative; margin-top: 9px;  max-width: 100%;  font-family: 'Poppins', sans-serif; ${
  //            printSetting?.testnewpage ? " page-break-after: always;" : ""
  //          }">
  //       <div style="margin-top: 20px;">
  //           ${testTable(test)}
  //       </div>
  //       ${
  //         printSetting?.showendline && printSetting.endlineposition === "true"
  //           ? `<p style='text-align: center; margin-top: 1rem; font-size: 12px; font-weight: bold;'>${printSetting.endline}
  //       </p>`
  //           : ""
  //       }
  //       ${
  //         index ===
  //         tests
  //           .filter(
  //             (p) =>
  //               !selected ||
  //               selected.find((s) => s.type === "test" && s.name === p.name)
  //           )
  //           .filter((test) => test.observedValue).length -
  //           1
  //           ? signs
  //           : ""
  //       }
  //   </div>
  //       `;
  //   });

  const html = `<!DOCTYPE html>
                <html>
                  <style>
                    td{
                      padding-left: 7px;

                    }
                    th{
                      padding-left: 7px;
                    }
                  </style>
                  <body style="">
                    ${combinedHtml}
                  </body>
                </html>       
              `;
  return html;
};
