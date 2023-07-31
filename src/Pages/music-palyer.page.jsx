import React, { useState } from 'react';
import { parseString } from 'xml2js';
import ReactPlayer from 'react-player';
import JSZip from 'jszip';

import './music-player.css';
const MusicPlayerWithUpload = () => {
   const [musicXML, setMusicXML] = useState(null);

   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            try {
               const zip = await JSZip.loadAsync(arrayBuffer);
               const xmlFile = await zip
                  .file('META-INF/container.xml')
                  .async('text');
               const parser = new DOMParser();
               const xmlDoc = parser.parseFromString(xmlFile, 'text/xml');
               const rootFile = xmlDoc.querySelector('rootfile');
               const musicXmlPath = rootFile.getAttribute('full-path');

               const musicXmlContent = await zip
                  .file(musicXmlPath)
                  .async('text');
               parseString(musicXmlContent, (err, result) => {
                  if (err) {
                     console.error('Error parsing XML:', err);
                  } else {
                     setMusicXML(result);
                  }
               });
            } catch (err) {
               console.error('Error uncompressing MXL:', err);
            }
         };
         reader.readAsArrayBuffer(file);
      }
   };

   const getTitle = () => {
      if (!musicXML) return null;
      const artist = musicXML['score-partwise'].credit;
      const artistName = artist[artist.length - 1]['credit-words'][0]['_'];
      const trackName = artist[0]['credit-words'][0]['_'];
      return artistName + ' - ' + trackName;
   };

   const renderNotes = () => {
      if (!musicXML) return null;
      console.log('musicXML', musicXML);
      const notes = musicXML['score-partwise']?.part?.[0]?.measure;
      // console.log(notes[0]);
      if (!notes) return null;
      return notes.map((note, index) => {
         // console.log('dasd', note.note && note.note.type && note.note[0].type[0]);
         return (
            <div
               key={index}
               style={{
                  width: note['$'].width,
                  display: 'flex',
                  gap: 5
               }}
            >
               <p>number: {note['$'].number} </p>
            </div>
         );
      });
   };

   return (
      <div>
         <h2>Notes</h2>
         <input
            className='upload-input'
            type='file'
            accept='.mxl'
            onChange={handleFileChange}
         />

         {musicXML && (
            <div>
               <h3>{getTitle()}</h3>
               {/* <ReactPlayer url={getAudioURL()} controls playing /> */}
            </div>
         )}

         <div className='render-notes'>{renderNotes()}</div>
      </div>
   );
};

export default MusicPlayerWithUpload;
