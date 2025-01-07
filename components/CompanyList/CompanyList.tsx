// import React from 'react';
// import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
// // import { Company } from '../../type/Company';
// import { companyData } from '../../mock/JobData';

// const JobCard: React.FC<{ company: Company }> = ({ company }) => {
//     return (
//       <View style={styles.card}>
//         <View style={styles.header}>
//           <Image source={{ uri: company.image }} style={styles.logo} />
//           <View style={styles.headerText}>
//             <Text style={styles.jobTitle}>{company.overview.title}</Text>
//             <Text style={styles.companyName}>{company.name}</Text>
//             <Text style={styles.salary}>{company.jobs[0].salary}</Text>
//           </View>
//         </View>
//         <View style={styles.locationRow}>
//           <Text style={styles.location}>{company.jobs[0].location}</Text>
//         </View>
//         <View style={styles.descriptionRow}>
//           <Text style={styles.description}>{company.overview.description}</Text>
//         </View>
//         <View style={styles.tagsRow}>
//           {company.jobs[0].tags.map((tag, index) => (
//             <Text key={index} style={styles.tag}>
//               {tag}
//             </Text>
//           ))}
//         </View>
//         <Text style={styles.postDate}>{company.jobs[0].postDate}</Text>
//       </View>
//     );
//   };
  
//   // Component to render the list of companies with jobs
//   const CompanyList: React.FC = () => {
//     return (
//       <FlatList
//         data={companyData}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => <JobCard company={item} />}
//         contentContainerStyle={styles.list}
//       />
//     );
//   };
  
//   // Styles for the job cards and list
//   const styles = StyleSheet.create({
//     list: {
//       padding: 10,
//     },
//     card: {
//       backgroundColor: '#fff',
//       borderRadius: 8,
//       padding: 15,
//       marginBottom: 15,
//       borderColor: '#ccc',
//       borderWidth: 1,
//     },
//     header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 10,
//     },
//     logo: {
//       width: 50,
//       height: 50,
//       resizeMode: 'contain',
//       marginRight: 15,
//     },
//     headerText: {
//       flex: 1,
//     },
//     jobTitle: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       color: '#d32f2f',
//     },
//     companyName: {
//       fontSize: 16,
//       color: '#000',
//       marginBottom: 5,
//     },
//     salary: {
//       color: '#388e3c',
//       fontWeight: 'bold',
//     },
//     locationRow: {
//       marginBottom: 10,
//     },
//     location: {
//       color: '#757575',
//     },
//     descriptionRow: {
//       marginBottom: 10,
//     },
//     description: {
//       color: '#757575',
//     },
//     tagsRow: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       marginBottom: 10,
//     },
//     tag: {
//       backgroundColor: '#e0e0e0',
//       borderRadius: 4,
//       paddingHorizontal: 10,
//       paddingVertical: 5,
//       marginRight: 5,
//       marginBottom: 5,
//       fontSize: 12,
//       color: '#616161',
//     },
//     postDate: {
//       color: '#9e9e9e',
//       fontSize: 12,
//     },
//   });
  
//   export default CompanyList;